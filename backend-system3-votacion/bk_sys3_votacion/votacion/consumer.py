from channels.generic.websocket import AsyncJsonWebsocketConsumer

class ConteoConsumer(AsyncJsonWebsocketConsumer):
    async def connect(self):
        await self.channel_layer.group_add("conteo_votos", self.channel_name)
        await self.accept()

    async def disconnect(self, close_code):
        await self.channel_layer.group_discard("conteo_votos", self.channel_name)

    async def receive_json(self, content):
        pass  # No hace falta recibir nada, solo emitir

    async def voto_emitido(self, event):
        await self.send_json(event["data"])