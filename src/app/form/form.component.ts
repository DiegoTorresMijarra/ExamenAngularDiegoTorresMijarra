import { Component, OnInit } from '@angular/core'
import { MatError, MatFormField, MatLabel } from '@angular/material/form-field'
import {
  AbstractControl,
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  ValidationErrors,
  Validators,
} from '@angular/forms'
import { NgForOf, NgIf } from '@angular/common'
import { MatInput } from '@angular/material/input'
import { MatCheckbox } from '@angular/material/checkbox'
import { MatRadioButton, MatRadioGroup } from '@angular/material/radio'

export class LineaPedido {
  destino: string
  peso: number
  tipoEnvio: string
  precio: number

  constructor(
    destino: string,
    peso: number,
    tipoEnvio: string,
    precio: number,
  ) {
    this.destino = destino
    this.peso = peso
    this.tipoEnvio = tipoEnvio
    this.precio = precio
  }
}

@Component({
  selector: 'app-form',
  standalone: true,
  imports: [
    MatFormField,
    MatLabel,
    MatError,
    NgIf,
    ReactiveFormsModule,
    MatInput,
    MatCheckbox,
    MatRadioGroup,
    MatRadioButton,
    NgForOf,
  ],
  templateUrl: './form.component.html',
  styleUrl: './form.component.css',
})
export class FormComponent implements OnInit {
  precioLineaEnvio: number = 0
  formularioEnvio: FormGroup
  formularioPedido: FormGroup
  fechaHoy: string
  pedidos: LineaPedido[] = []

  totalPeso: number = 0
  totalEspana: number = 0
  totalEuropa: number = 0
  totalAmerica: number = 0
  totalTotales: number = 0
  constructor(
    private fb: FormBuilder,
    private fb2: FormBuilder,
  ) {
    const today: Date = new Date()
    const year: number = today.getFullYear()
    const month: number = today.getMonth() + 1
    const day: number = today.getDate()

    this.fechaHoy = `${day}/${month}/${year}`

    this.formularioEnvio = this.fb.group({
      fecha: ['', [Validators.required, validDate()]],
      empresa: [
        '',
        [
          Validators.required,
          Validators.minLength(2),
          Validators.maxLength(100),
        ],
      ],
      email: ['', [Validators.required, Validators.email]],
      instagram: ['', [Validators.required, validInstagram()]],
      clienteCheckbox: [''],
      cliente: [''],
      destino: ['', Validators.required],
      pais: [
        '',
        [
          Validators.required,
          Validators.minLength(2),
          Validators.maxLength(50),
        ],
      ],
    })
    this.formularioPedido = this.fb2.group({
      destinoEnvio: ['', Validators.required],
      peso: ['', [Validators.required, validPeso()]],
      tipoEnvio: ['', Validators.required],
      precio: [''],
    })
  }
  ngOnInit(): void {
    this.suscribirCambiosFormularioPedido()
    this.formularioEnvio.get('fecha')?.setValue(this.fechaHoy)
  }

  suscribirCambiosFormularioPedido() {
    this.formularioPedido.valueChanges.subscribe(() => {
      this.calcularPrecioPedido()
    })
  }
  onSubmit() {
    if (this.formularioEnvio.invalid) {
      alert(
        'Por favor, complete todos los campos  del formulario correctamente',
      )
    } else {
      if (this.pedidos.length === 0) {
        alert('Por favor, añada un pedido al menos')
      } else
        alert(
          JSON.stringify({
            Formulario: this.formularioEnvio.getRawValue(),
            Pedidos: this.pedidos,
            TotalPrecio: this.totalTotales,
            TotalPeso: this.totalPeso,
            TotalEspana: this.totalEspana,
            TotalEuropa: this.totalEuropa,
            TotalAmerica: this.totalAmerica,
          }),
        )
    }
  }

  anadirPedido() {
    if (this.formularioPedido.invalid) {
      alert('Por favor, completa correctamente todos los campos del envio.')
      Object.values(this.formularioPedido.controls).forEach((control) => {
        control.markAsTouched()
      })
    } else {
      this.pedidos.push(
        new LineaPedido(
          this.formularioPedido.value.destinoEnvio,
          this.formularioPedido.value.peso,
          this.formularioPedido.value.tipoEnvio,
          this.precioLineaEnvio,
        ),
      )
      this.formularioPedido.reset()
    }
    this.calcularTotales()
  }
  eliminarPedido(index: number) {
    this.pedidos.splice(index, 1)
    this.calcularTotales()
  }

  calcularPrecioPedido() {
    let precio: number = 0
    const precios = [
      [
        [6, 8, 10],
        [4, 5, 6],
      ],
      [
        [9, 12, 16],
        [7, 9, 12],
      ],
      [
        [12, 16, 20],
        [10, 12, 14],
      ],
    ]

    if (this.formularioPedido.valid) {
      const destino: string = this.formularioPedido.value.destinoEnvio

      const tEnvio: string = this.formularioPedido.value.tipoEnvio
      let envioOption: number = 0

      if (tEnvio) {
        if (tEnvio == 'certificado') {
          envioOption = 0
        }
        if (tEnvio == 'paquete') {
          envioOption = 1
        }
      }

      const peso: number = this.formularioPedido.value.peso
      let pesoOption: number = 0

      if (peso) {
        if (peso < 1) {
          pesoOption = 0
        } else if (peso < 2) {
          pesoOption = 1
        } else {
          pesoOption = 2
        }
      }

      switch (destino) {
        case 'espana':
          precio = precios[0][envioOption][pesoOption]
          break
        case 'europa':
          precio = precios[1][envioOption][pesoOption]
          break
        case 'america':
          precio = precios[2][envioOption][pesoOption]
          break
        default:
          break
      }
    }

    this.precioLineaEnvio = precio
  }
  calcularTotales() {
    this.totalEspana = 0
    this.totalEuropa = 0
    this.totalAmerica = 0
    this.totalTotales = 0
    this.totalPeso = 0

    this.pedidos.forEach((pedido) => {
      this.totalPeso += pedido.peso

      switch (pedido.destino) {
        case 'espana':
          this.totalEspana += pedido.precio
          break
        case 'europa':
          this.totalEuropa += pedido.precio
          break
        case 'america':
          this.totalAmerica += pedido.precio
          break
        default:
          break
      }
    })

    this.totalTotales = this.totalEspana + this.totalEuropa + this.totalAmerica
  }
}
export function validDate(): ValidationErrors | null {
  let today = new Date()
  let todayDay = today.getDate()
  let todayMonth = today.getMonth() + 1
  let todayYear = today.getFullYear()

  return (control: AbstractControl): ValidationErrors | null => {
    let fecha = control.value

    let partesFecha = fecha.split('/')
    let dia = parseInt(partesFecha[0], 10)
    let mes = parseInt(partesFecha[1], 10)
    let ano = parseInt(partesFecha[2], 10)

    if (isNaN(dia) || isNaN(mes) || isNaN(ano)) {
      return { invalidDate_NotNumber: { value: control.value } }
    }

    if (mes < 1 || mes > 12) {
      return { invalidDate_WrongM: { value: control.value } }
    }

    let diasEnMes = new Date(ano, mes, 0).getDate()
    if (dia < 1 || dia > diasEnMes) {
      return { invalidDate_WrongD: { value: control.value } }
    }

    if (ano < 0) {
      return { invalidDate_WrongY: { value: control.value } }
    }

    if (
      ano < todayYear ||
      (ano === todayYear && mes < todayMonth) ||
      (ano === todayYear && mes === todayMonth && dia < todayDay)
    ) {
      return { invalidDate_PastDate: { value: control.value } }
    }
    return null
  }
}
export function validInstagram(): ValidationErrors | null {
  return (control: AbstractControl): ValidationErrors | null => {
    const inst: string = control.value

    if (inst.at(0) != '@') {
      return { noArroba: { value: control.value } }
    }
    if (inst.length < 2 || inst.length > 20) {
      return { invalidLenght: { value: control.value } }
    }
    return null
  }
}
export function validPeso(): ValidationErrors | null {
  return (control: AbstractControl): ValidationErrors | null => {
    const peso: string = control.value
    const pesoNumero = parseFloat(peso)

    const pesoPattern = /^\d{1,2}\.\d{2}$/

    if (!pesoNumero || !pesoPattern.test(peso)) {
      return { invalidFormat: { value: control.value } }
    }

    if (pesoNumero > 3.0) {
      return { invalidMax: { value: control.value } }
    }

    return null
  }
}
