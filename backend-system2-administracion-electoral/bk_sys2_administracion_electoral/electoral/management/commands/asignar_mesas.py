from django.core.management.base import BaseCommand
from electoral.models import (
    ParticipacionVotanteEleccion,
    MesaElectoral
)

class Command(BaseCommand):
    help = "Asigna cada participación a una mesa electoral por sección"

    def handle(self, *args, **options):
        total = 0

        # Agrupar por sección y elección
        participaciones = ParticipacionVotanteEleccion.objects.filter(mesa__isnull=True)
        by_group = {}
        for p in participaciones:
            key = (p.eleccion_id, p.seccion_id)
            by_group.setdefault(key, []).append(p)

        for (ele_id, sec_id), plist in by_group.items():
            mesas = list(MesaElectoral.objects.filter(
                eleccion_id=ele_id, recinto__seccion_id=sec_id
            ))
            if not mesas:
                self.stdout.write(self.style.WARNING(
                    f"No hay mesas para eleccion={ele_id}, seccion={sec_id}"
                ))
                continue

            # Orden alfabético de votante
            plist.sort(key=lambda p: p.votante.nombre_completo)

            # Round-robin: asigna p0→m0, p1→m1, … pN→m(N%len(mesas))
            for idx, p in enumerate(plist):
                mesa = mesas[idx % len(mesas)]
                p.mesa = mesa
                p.save(update_fields=['mesa'])
                total += 1

        self.stdout.write(self.style.SUCCESS(f"{total} asignaciones hechas"))