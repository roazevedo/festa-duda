ENV["BUNDLE_GEMFILE"] ||= File.expand_path("../Gemfile", __dir__)

ENV["RACK_TIMEOUT_SERVICE_TIMEOUT"] ||= "120"

require "bundler/setup"
require "bootsnap/setup"
