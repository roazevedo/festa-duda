class CreateGiftPayments < ActiveRecord::Migration[7.2]
  def change
    create_table :gift_payments do |t|
      t.references :gift, null: false, foreign_key: true
      t.decimal :amount, precision: 10, scale: 2, null: false
      t.string :status, null: false, default: "pending"
      t.string :mp_preference_id
      t.string :mp_payment_id
      t.string :payer_email

      t.timestamps
    end
    add_index :gift_payments, :mp_payment_id, unique: true
    add_index :gift_payments, :status
  end
end
