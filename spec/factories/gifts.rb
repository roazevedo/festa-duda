FactoryBot.define do
  factory :gift do
    association :event
    name        { Faker::Commerce.product_name }
    description { Faker::Lorem.sentence(word_count: 5) }
    price       { Faker::Commerce.price(range: 50.0..600.0) }
  end
end
