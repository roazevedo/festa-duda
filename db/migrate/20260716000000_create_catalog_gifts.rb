class CreateCatalogGifts < ActiveRecord::Migration[7.2]
  def change
    create_table :catalog_gifts do |t|
      t.string  :key,        null: false
      t.string  :event_type, null: false
      t.string  :name,       null: false
      t.string  :description
      t.decimal :price, precision: 10, scale: 2, null: false
      t.string  :category
      t.string  :image_url
      t.integer :position,   null: false, default: 0

      t.timestamps
    end

    add_index :catalog_gifts, [ :event_type, :key ], unique: true
    add_index :catalog_gifts, [ :event_type, :position ]
  end
end
