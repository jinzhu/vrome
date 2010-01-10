#!/usr/bin/perl
# A simple web server that just listens for textarea filter requests
# and runs an editor to manipulate the text.  It was originally developed for
# the TextAid extention for Chrome.

use strict;
use warnings;
use threads;
use Socket;
use IO::Select;
use File::Temp;

our $PORT = 20000;
our $EDITOR_CMD = '/usr/bin/gvim -f %s';
#our $EDITOR_CMD = '/usr/bin/emacsclient -c %s';
our $TMPDIR = '/tmp';
our $CLEAN_AFTER_HOURS = 4;

$|  = 1;

local *S;
socket(S, PF_INET, SOCK_STREAM , getprotobyname('tcp')) or die "couldn't open socket: $!\n";
setsockopt(S, SOL_SOCKET, SO_REUSEADDR, 1);
bind(S, sockaddr_in($PORT, INADDR_ANY));
listen(S, 5) or die "listen failed: $!\n";

my $ss = IO::Select->new();
$ss->add(*S);

while (1) {
    my @con = $ss->can_read();
    foreach my $con (@con) {
    my $fh;
    my $remote = accept($fh, $con);
    my($port, $iaddr) = sockaddr_in($remote);
    my $addr = inet_ntoa($iaddr);

    my $t = threads->create(\&do_edit, $fh);
    $t->detach();
    }
}

exit;

# Read the text from the content body, edit it, and write it back as our output.
sub do_edit
{
    my($fh) = @_;
    binmode $fh;

    local $_ = <$fh>;
    my($method, $path, $ver) = /^(GET|POST)\s+(.*?)\s+(HTTP\S+)/;
    unless (defined $ver) {
    http_header($fh, 500, 'Invalid request.');
    close $fh;
    return;
    }
    if ($method eq 'GET') {
    http_header($fh, 200, 'Server is up and running.');
    close $fh;
    return;
    }

    my %header;

    while (<$fh>) {
    s/\r?\n$//;
    last if $_ eq '';

    my($name, $value) = /^(.*?): +(.*)/;
    $header{lc($name)} = $value;
    }

    my $len = $header{'content-length'};
    unless (defined $len && $len =~ /^\d+$/) {
    http_header($fh, 500, 'Invalid request -- no content-length.');
    close $fh;
    return;
    }

    my $tmp = new File::Temp(
    TEMPLATE => 'edit-server-XXXXXX',
    DIR => $TMPDIR,
    SUFFIX => '.txt',
    UNLINK => 0,
    );
    my $name = $tmp->filename;

    my $got = read($fh, $_, $len);
    if ($got != $len) {
    http_header($fh, 500, 'Invalid request -- wrong content-length.');
    close $fh;
    return;
    }

    print $tmp $_;
    close $tmp;

    my $cmd = sprintf($EDITOR_CMD, $name);
    system $cmd;

    unless (open FILE, '<', $name) {
    http_header($fh, 500, "Unable to re-open $name: $!");
    close $fh;
    return;
    }

    http_header($fh, 200);
    print $fh <FILE>;

    close FILE;
    close $fh;

    # Clean-up old tmp files that have been around for a few hours.
    if (opendir(DP, $TMPDIR)) {
    foreach my $fn (grep /^edit-server-......\.txt$/, readdir DP) {
        $fn = "$TMPDIR/$fn";
        if (-M $fn > $CLEAN_AFTER_HOURS/24) {
        unlink $fn;
        }
    }
    }
}

sub http_header
{
    my $fh = shift;
    my $status = shift;
    print $fh "HTTP/1.0 $status\r\n",
          "Server: edit-server\r\n",
          "Content-Type: text/plain\r\n",
          "\r\n", @_;
}
