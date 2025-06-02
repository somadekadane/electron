document.addEventListener('DOMContentLoaded', () => {
    btnUpdate.disabled = true
    btnDelete.disabled = true
    foco.focus()
})
let frmMoto = document.getElementById('frmMoto')
let proprietarioMoto = document.getElementById('inputProprietarioClient')
let marcaMoto = document.getElementById('inputMarcaClient')
let modeloMoto = document.getElementById('inputModeloClient')
let anoMoto = document.getElementById('inputAnoClient')
let placaMoto = document.getElementById('inputPlacaClient')
let corMoto = document.getElementById('inputCorClient')
let chassiMoto = document.getElementById('inputChassiClient')

frmMoto.addEventListener('submit', async (event) => {

    event.preventDefault()
    console.log(proprietarioMoto.value, marcaMoto.value, modeloMoto.value, anoMoto.value, placaMoto.value, corMoto.value, chassiMoto.value)

    const mot = {
        proMot: proprietarioMoto.value,
        marMot: marcaMoto.value,
        modMot: modeloMoto.value,
        anoMot: anoMoto.value,
        plaMot: placaMoto.value,
        corMot: corMoto.value,
        chasMot: chassiMoto.value
    }
    api.newMoto(mot)
})

function resetForm() {
    location.reload()
}

api.resetForm((args) => {
    resetForm()
})