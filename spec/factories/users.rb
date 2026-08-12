FactoryBot.define do
  factory :user do
    email             { Faker::Internet.unique.email }
    password          { 'Senha@123456' }
    admin             { false }
    email_verified_at { Time.current }

    trait :admin do
      admin { true }
    end

    # Conta de cadastro manual ainda não confirmada por código.
    trait :unverified do
      email_verified_at { nil }
    end
  end
end
