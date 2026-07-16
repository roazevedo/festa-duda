class AddImageUrlToGifts < ActiveRecord::Migration[7.2]
  def change
    add_column :gifts, :image_url, :string
  end
end
