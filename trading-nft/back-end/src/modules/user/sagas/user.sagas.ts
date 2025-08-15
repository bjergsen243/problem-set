import { Injectable } from '@nestjs/common';
import { ICommand, ofType, Saga } from '@nestjs/cqrs';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { UserCreatedEvent } from '../events/impl/user-created.event';
import { UserUpdatedEvent } from '../events/impl/user-updated.event';
import { UserDeletedEvent } from '../events/impl/user-deleted.event';

@Injectable()
export class UserSagas {
  @Saga()
  userCreated = (events$: Observable<any>): Observable<ICommand> => {
    return events$.pipe(
      ofType(UserCreatedEvent),
      map((event) => {
        // Here you can trigger side effects after user creation
        // For example: send welcome email, create in elasticsearch, etc.
        return null;
      }),
    );
  };

  @Saga()
  userUpdated = (events$: Observable<any>): Observable<ICommand> => {
    return events$.pipe(
      ofType(UserUpdatedEvent),
      map((event) => {
        // Here you can trigger side effects after user update
        // For example: update in elasticsearch, send notification, etc.
        return null;
      }),
    );
  };

  @Saga()
  userDeleted = (events$: Observable<any>): Observable<ICommand> => {
    return events$.pipe(
      ofType(UserDeletedEvent),
      map((event) => {
        // Here you can trigger side effects after user deletion
        // For example: remove from elasticsearch, cleanup related data, etc.
        return null;
      }),
    );
  };
} 