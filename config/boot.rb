ENV["BUNDLE_GEMFILE"] ||= File.expand_path("../Gemfile", __dir__)

# Configura o rack-timeout antes da gem ser carregada
ENV["RACK_TIMEOUT_SERVICE_TIMEOUT"] ||= "15"

require "bundler/setup" # Set up gems listed in the Gemfile.
require "bootsnap/setup" # Speed up boot time by caching expensive operations.
