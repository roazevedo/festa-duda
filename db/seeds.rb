admin = User.find_or_create_by(email: 'seu@email.com') do |u|
  u.password = 'SuaSenhaSegura123!'
  u.admin    = true
end

event = Event.find_or_create_by(slug: 'maria-eduarda') do |e|
  e.user          = admin
  e.name          = 'Maria Eduarda'
  e.event_type    = 'quinze_anos'
  e.event_date    = DateTime.new(2026, 8, 29, 21, 0, 0)
  e.venue_name    = 'Salão Elite'
  e.venue_address = 'Rua Vítor Meireles, 485, Riachuelo, Rio de Janeiro'
  e.settings      = {
    theme: 'cortina_de_veludo',
    colors: { primary: '#8b1a1a', gold: '#c9a84c' }
  }
end

puts "Admin criado: #{admin.email}"
puts "Evento: #{event.name}"
puts "Token:  #{event.token}"
puts "URL:    /#{event.slug}/#{event.token}"
