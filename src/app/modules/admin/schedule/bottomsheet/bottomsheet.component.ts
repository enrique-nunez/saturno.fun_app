import { Inject } from '@angular/core';
import { Component, OnInit } from '@angular/core';
import { MatBottomSheetRef, MAT_BOTTOM_SHEET_DATA } from '@angular/material/bottom-sheet';
import { avTable, availability } from '../../../../interfaces/availability.interface';
import { Ticket, TicketResponse } from '../../../../interfaces/ticket.interface';
import { PublicService } from '../../../public/public.service';
import { WaiterService } from '../../../waiter/waiter.service';
import { Table } from 'src/app/interfaces/table.interface';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { AdminService } from '../../admin.service';


interface dataSheet {
  table: avTable,
  availability: availability,
  idSection: string
}

@Component({
  selector: 'app-bottomsheet',
  templateUrl: './bottomsheet.component.html',
  styleUrls: ['./bottomsheet.component.css']
})
export class BottomsheetComponent implements OnInit {

  ticketForm: FormGroup;
  personsExceeds = false;
  cdTables: number[] = [];
  title: string;
  subtitle: string;

  nmOccupation: number;

  constructor(
    private bottomSheetRef: MatBottomSheetRef<BottomsheetComponent>,
    private publicService: PublicService,
    private waiterService: WaiterService,
    private adminService: AdminService,
    @Inject(MAT_BOTTOM_SHEET_DATA) public data: dataSheet
  ) {

    if (this.data.table.blReserved) {
      this.title = 'Editar Reserva';
      this.subtitle = 'Ver ticket o des-asignar mesa al cliente';
      this.nmOccupation = Math.round(this.data.table.nmPersons / this.data.table.ticketOwner.nm_persons * 100);
      
    } else {

      this.cdTables.push(this.data.table.nmTable);
      this.title = 'Crear Reserva';
      this.subtitle = 'Crear un ticket de contingencia y asignarle la mesa ' + data.table.nmTable;
    }

  }

  ngOnInit(): void {
    this.ticketForm = new FormGroup({
      txName: new FormControl('', [Validators.required, Validators.maxLength(30)]),
      nmPersons: new FormControl('', [Validators.required, Validators.min(1), Validators.max(1000)]),
      idUser: new FormControl('', [Validators.required, Validators.min(999999), Validators.max(99999999999)]),
    });

    this.ticketForm.controls.nmPersons.valueChanges.subscribe(persons => {
      this.personsExceeds = persons > this.data.table.nmPersons ? true : false;
    })
  }

  setReserve = (table: avTable) => {
    this.cdTables = this.cdTables.includes(table.nmTable)
      ? this.cdTables.filter((numtable) => numtable !== table.nmTable)
      : [...this.cdTables, table.nmTable];
  };

  createTicket(): void {

    if (this.ticketForm.invalid) {
      this.publicService.snack('Faltan datos por favor verifique.', 3000);
      return;
    }


    const blContingent = true;
    const txName = this.ticketForm.value.txName;
    const nmPersons = this.ticketForm.value.nmPersons;
    const idSection = this.data.idSection;
    const idUser = this.ticketForm.value.idUser;
    const cdTables = this.cdTables;
    const tmReserve = this.data.availability.interval;

    this.adminService.createTicket(blContingent, txName, nmPersons, idSection, tmReserve, idUser, cdTables)
    .subscribe((resp: TicketResponse) => {
      if (resp.ok) {
        this.bottomSheetRef.dismiss({
          action: 'create',
          ticket: resp.ticket // updated ticket with no cdTables []
        });
      } else {
        this.publicService.snack('Error al asignar las mesas!', 2000);
      }
      }
    );
  }

  assignTablesPending = () => {

    let blPriority = this.data.table.ticketOwner.bl_priority;
    let blFirst = false;
    let idTicket = this.data.table.ticketOwner._id;
    let cdTables = [];

    this.waiterService.assignTablesPending(idTicket, blPriority, blFirst, cdTables)
    .subscribe((resp: TicketResponse) => {
      if (resp.ok) {
        this.bottomSheetRef.dismiss({
          action: 'release',
          ticket: resp.ticket // updated ticket with no cdTables []
        });
      } else {
        this.publicService.snack('Error al asignar las mesas!', 2000);
      }
    },
      () => {
        this.publicService.snack('Error al asignar las mesas!', 2000);
      }
    );
  };

  endTicket = () => {

    const ticket = this.data.table.ticketOwner;

    if (!ticket) {
      this.publicService.snack('Seleccione una mesa primero', 3000);
    }

    const idTicket = ticket._id;
    const reqBy = 'client';
    this.publicService.snack('Desea cancelar el ticket actual?', 5000, 'Si, cancelar').then((ok: boolean) => {
      if (ok) {
        // publicService.endTicket() 
        // -> reqBy: 'waiter' -> tx_status: 'finished'
        // -> reqBy: 'client' -> tx_status: 'cancelled'
        this.publicService.endTicket(idTicket, reqBy).subscribe((resp: TicketResponse) => {
          if (resp.ok) {
            this.bottomSheetRef.dismiss({ action: 'cancel', tables: resp.ticket.cd_tables });
          } else {
            this.publicService.snack('Error al asignar las mesas!', 2000);
          }
        });
      }
    });

  };

  sendMessage() {
    this.publicService.snack('Esta opción todavía no esta disponible.', 5000, 'Aceptar');
  }
}
