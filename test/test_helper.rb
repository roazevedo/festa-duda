ENV["RAILS_ENV"] ||= "test"
require_relative "../config/environment"
require "rails/test_help"
require "minitest/reporters"

Minitest::Reporters.use! Minitest::Reporters::ProgressReporter.new

module ActiveSupport
  class TestCase
    include FactoryBot::Syntax::Methods
    fixtures :none  # usamos factories, não fixtures

    parallelize(workers: :number_of_processors)
  end
end
