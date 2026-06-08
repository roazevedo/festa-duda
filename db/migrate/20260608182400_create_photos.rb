class CreatePhotos < ActiveRecord::Migration[7.2]
  def change
    create_table :photos do |t|
      t.references :event, null: false, foreign_key: true
      t.string :url
      t.string :thumb_url
      t.string :caption
      t.string :cloudinary_id

      t.timestamps
    end
  end
end
