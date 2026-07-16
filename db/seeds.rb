# Catálogo de presentes sugeridos — sincroniza db/gift_catalog.yml
# com a tabela catalog_gifts (idempotente; também disponível como
# `rails catalog:sync`).
CatalogGift.sync_from_file!
puts "Catálogo de presentes: #{CatalogGift.count} itens."

# O admin inicial é criado a partir de variáveis de ambiente — nunca
# deixe email/senha reais neste arquivo, pois ele fica versionado.
#
# Em produção (Fly.io):
#   fly secrets set ADMIN_EMAIL=voce@email.com ADMIN_PASSWORD='senha-forte'
#
# O docker-entrypoint roda db:prepare no boot, que executa este seed
# na primeira subida (banco recém-criado). Sem as variáveis, nada é
# criado — dá para rodar depois com `bin/rails db:seed`.
admin_email    = ENV["ADMIN_EMAIL"]
admin_password = ENV["ADMIN_PASSWORD"]

if admin_email.blank? || admin_password.blank?
  puts "ADMIN_EMAIL/ADMIN_PASSWORD não definidos — nenhum admin criado."
  return
end

admin = User.find_or_create_by!(email: admin_email) do |u|
  u.password = admin_password
  u.admin    = true
end
admin.update!(admin: true) unless admin.admin?

event = Event.find_or_create_by!(slug: "maria-eduarda") do |e|
  e.user          = admin
  e.name          = "Maria Eduarda"
  e.event_type    = "quinze_anos"
  e.event_date    = DateTime.new(2026, 8, 29, 21, 0, 0)
  e.venue_name    = "Salão Elite"
  e.venue_address = "Rua Vítor Meireles, 485, Riachuelo, Rio de Janeiro"
  e.settings      = {
    theme: "cortina_de_veludo",
    colors: { primary: "#8b1a1a", gold: "#c9a84c" }
  }
end

puts "Admin criado: #{admin.email}"
puts "Evento: #{event.name}"
puts "URL:    /#{event.slug}/#{event.token}"
