FactoryBot.define do
  factory :message do
    association :event
    name { Faker::Name.name }
    body { Faker::Lorem.paragraph }
  end
end
