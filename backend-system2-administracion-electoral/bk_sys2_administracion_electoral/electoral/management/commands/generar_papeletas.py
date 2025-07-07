from django.core.management.base import BaseCommand
from electoral.models import Eleccion, Papeleta, Cargo

class Command(BaseCommand):
    help = "Genera Papeleta (elección×sección×cargo) y asigna sus candidaturas"

    def handle(self, *args, **options):
        # 1) Limpiar viejas papeletas
        Papeleta.objects.all().delete()

        total = 0
        # 2) Solo elecciones activas (quita filter si quieres todas)
        for ele in Eleccion.objects.filter(activa=True):
            for sec in ele.secciones.all():
                # cargos de esta elección en esta sección
                cargos = Cargo.objects.filter(eleccion=ele, secciones=sec)
                for cargo in cargos:
                    papeleta, created = Papeleta.objects.get_or_create(
                        eleccion=ele,
                        seccion=sec,
                        cargo=cargo
                    )
                    # 3) Vincular todas las candidaturas de este cargo
                    papeleta.candidaturas.set(cargo.candidaturas.all())
                    total += 1

        self.stdout.write(
            self.style.SUCCESS(f"{total} papeleta(s) generada(s)")
        )