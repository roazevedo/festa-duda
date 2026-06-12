FactoryBot.define do
  factory :rsvp do
    association :event
    name { Faker::Name.name }
    guests      { rand(0..3) }
    attending   { 'yes' }
    restriction { '' }
  end
end
