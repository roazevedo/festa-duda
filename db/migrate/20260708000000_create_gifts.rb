class CreateGifts < ActiveRecord::Migration[7.2]
  def change
    create_table :gifts do |t|
      t.references :event, null: false, foreign_key: true
      t.string :name, null: false
      t.string :description
      t.decimal :price, precision: 10, scale: 2, null: false

      t.timestamps
    end
  end
end
