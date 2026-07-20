FactoryBot.define do
  factory :plan_payment do
    association :event
    plan   { "completo" }
    amount { Event::PLAN_PRICES.fetch(plan, 149.90) }
    status { "pending" }
  end
end
