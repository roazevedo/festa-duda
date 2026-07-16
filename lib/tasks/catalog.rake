namespace :catalog do
  desc "Sincroniza o catálogo de presentes a partir de db/gift_catalog.yml"
  task sync: :environment do
    CatalogGift.sync_from_file!
    puts "Catálogo sincronizado: #{CatalogGift.count} itens."
    CatalogGift.group(:event_type).count.each do |type, count|
      puts "  #{type}: #{count}"
    end
  end
end
