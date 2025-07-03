from electoral.models import Eleccion, Cargo, Seccion, Papeleta

def generar_papeletas(eleccion_id):
    eleccion = Eleccion.objects.get(id=eleccion_id)

    for cargo in eleccion.cargos.all():
        for seccion in cargo.secciones.all():
            papeleta, created = Papeleta.objects.get_or_create(
                eleccion=eleccion,
                seccion=seccion,
                cargo=cargo
            )
            candidaturas = cargo.candidaturas.filter(secciones=seccion)
            papeleta.candidaturas.set(candidaturas)