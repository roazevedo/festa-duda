FactoryBot.define do
  factory :gift_payment do
    association :gift
    amount { gift.price }
    status { "pending" }

    trait :approved do
      status        { "approved" }
      mp_payment_id { SecureRandom.random_number(10**10).to_s }
      payer_email   { Faker::Internet.email }
    end
  end
end
