admin = User.find_or_create_by(email: 'seu@email.com') do |u|
  u.password = 'SuaSenhaSegura123!'
  u.admin    = true
end

puts "Admin criado: #{admin.email}"
