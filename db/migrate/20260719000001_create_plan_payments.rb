class CreatePlanPayments < ActiveRecord::Migration[7.2]
  def change
    create_table :plan_payments do |t|
      t.references :event, null: false, foreign_key: true
      t.string  :plan,   null: false
      t.decimal :amount, precision: 10, scale: 2, null: false
      t.string  :status, null: false, default: "pending"
      t.string  :mp_preference_id
      t.string  :mp_payment_id
      t.string  :payer_email

      t.timestamps
    end
    add_index :plan_payments, :mp_payment_id, unique: true
    add_index :plan_payments, :status
  end
end
