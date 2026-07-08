require "webmock/rspec"

# Bloqueia qualquer chamada HTTP externa nos testes — chamadas ao
# Mercado Pago (e afins) devem ser stubadas explicitamente.
WebMock.disable_net_connect!(allow_localhost: true)
