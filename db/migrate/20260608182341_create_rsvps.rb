class CreateRsvps < ActiveRecord::Migration[7.2]
  def change
    create_table :rsvps do |t|
      t.references :event, null: false, foreign_key: true
      t.string :name
      t.integer :guests
      t.string :attending
      t.string :restriction

      t.timestamps
    end
  end
end
