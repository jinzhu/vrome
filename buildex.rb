#!/usr/bin/ruby
# vim: fileencoding=utf-8
require 'rubygems'
require 'zipruby'
require 'openssl'
require 'digest/sha1'
require 'optparse'
require 'fileutils'
require 'find'
 
class ExCreator < Object
  @@magic = [?C, ?r, ?2, ?4].pack('C*')
  @@version = [2].pack('L')
 
  # CERT_PUBLIC_KEY_INFO struct
  @@key_algo = %w(30 81 9F 30 0D 06 09 2A 86 48 86 F7 0D 01 01 01 05 00 03 81 8D 00 30 81 89 02 81 81).map{|s| s.hex}.pack('C*')
  @@key_foot = %w(02 03 01 00 01).map{|s| s.hex}.pack('C*')
  @@key_size = 1024
  def initialize o
    check_valid_option(o)
    if @pkey
      read_key
    else
      generate_key
    end
    create_zip
    sign_zip
    write_crx
  rescue => e
    puts e.message
  ensure
    final
  end
 
  def check_valid_option o
    @exdir, @pkey, @pkey_o, @crx = o[:ex_dir], o[:pkey], o[:pkey_output], o[:crx_output]
    @exdir = File.expand_path(@exdir) if @exdir
    raise "extension dir not exist" if !@exdir || !File.exist?(@exdir) || !File.directory?(@exdir)
    @pkey = File.expand_path(@pkey) if @pkey
    raise "private key not exist" if @pkey && (!File.exist?(@pkey) || !File.file?(@pkey))
    if @pkey_o
      @pkey_o = File.expand_path(@pkey_o)
      raise "private key output path is directory" if File.directory?(@pkey_o)
    else
      count = 0
      loop do
        if count.zero?
          @pkey_o = File.expand_path("./#{File.basename(@exdir)}.pem")
        else
          @pkey_o = File.expand_path("./#{File.basename(@exdir)}-#{count+=1}.pem")
        end
        break unless File.directory?(@pkey_o)
      end
    end
    if @crx
      @crx = File.expand_path(@crx)
      raise "crx path is directory" if File.directory?(@crx)
    else
      count = 0
      loop do
        if count.zero?
          @crx = File.expand_path("./#{File.basename(@exdir)}.crx")
        else
          @crx = File.expand_path("./#{File.basename(@exdir)}-#{count+=1}.crx")
        end
        break unless File.directory?(@crx)
      end
    end
    @crx_dir = File.dirname(@crx)
    @zip = File.join(@crx_dir, 'extension.zip')
  end
 
  def read_key
    File.open(@pkey, 'rb') do |io|
      @key = OpenSSL::PKey::RSA.new(io)
    end
  end
 
  def generate_key
    @key = OpenSSL::PKey::RSA.generate(@@key_size)
    # save key
    File.open(@pkey_o, 'wb') do |file|
      file << @key.export()
    end
  end
 
  def create_zip
    Zip::Archive.open(@zip, Zip::CREATE | Zip::TRUNC) do |zip|
      Find.find(@exdir) do |path|
        unless path == @exdir
          if File.directory?(path)
            if File.basename(path)[0] == ?.
              Find.prune
            else
              zip.add_dir(get_relative(@exdir, path))
            end
          else
            zip.add_file(get_relative(@exdir, path), path)
          end
        end
      end
    end
  end
 
  def get_relative base, target
    if base == target
      return '.'
    end
    if base[base.size - 1] != ?/
      base += '/'
    end
    target.sub(base, '')
  end
 
  def sign_zip
    plain = nil
    File.open(@zip, 'rb') do |file|
      plain = file.read
    end
    @sig = @key.sign(OpenSSL::Digest::SHA1.new, plain)
  end
 
  def write_crx
    key = @@key_algo + key_data + @@key_foot
    File.open(@crx, 'wb') do |file|
      file << @@magic
      file << @@version
      file << to_sizet(key.size)
      file << to_sizet(@sig.size)
      file << key
      file << @sig
      File.open(@zip, 'rb') do |zip|
        file << zip.read
      end
    end
  end
 
  def key_data
    pubkey = @key.public_key
    memo = pubkey.to_text.split(/\r|\n|\n\r/).inject({:flag => false, :data => []}){|memo, line|
      if memo[:flag]
        if line =~ /^\s+/
          memo[:data].push(*line.strip.split(':'))
        else
          memo[:flag] = false
        end
      elsif /^Modulus/ =~ line
        memo[:flag] = true
      end
      memo
    }
    data = memo[:data].map{|s| s.hex}.pack('C*')
    return data
  end
 
  def to_sizet num
    return [num].pack('L')
  end
 
  def final
    FileUtils.rm_rf(@zip) if @zip && File.exist?(@zip)
  end
end
 
# main
data = {}
OptionParser.new('Packaging Chromium Extension') do |opt|
  opt.version = '2'
  opt.on('--pack-extension DIR') do |val|
    data[:ex_dir] = val
  end
  opt.on('--pack-extension-key KEY') do |key|
    data[:pkey] = key
  end
  opt.on('--key-output OKEY') do |okey|
    data[:pkey_output] = okey
  end
  opt.on('--extension-output CRX') do |crx|
    data[:crx_output] = crx
  end
  opt.parse!(ARGV)
end
ExCreator.new(data)
