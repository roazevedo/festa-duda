class AddCategoryToPhotos < ActiveRecord::Migration[7.2]
  def change
    add_column :photos, :category, :string, default: 'galeria', null: false
    add_index  :photos, :category
  end
end
