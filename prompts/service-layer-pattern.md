# Prompt: Camada de Serviço / Use Case

## Contexto
A camada de aplicação (use cases / services) orquestra a lógica de negócio sem conhecer detalhes de HTTP ou banco.

## Estrutura Padrão
```typescript
// src/features/<feature>/application/<use-case>.ts

import { IRepository } from '../domain/repository.interface';
import { DomainEntity } from '../domain/entity';
import { ValidationError } from '@/shared/errors';

interface InputDTO {
  // campos de entrada validados
}

interface OutputDTO {
  // campos de saída
}

export class UseCaseName {
  constructor(private readonly repository: IRepository) {}

  async execute(input: InputDTO): Promise<OutputDTO> {
    // 1. Validação de negócio
    // 2. Orquestração de regras
    // 3. Persistência via repository
    // 4. Retorno de DTO
  }
}
```

## Regras
1. Use Case deve ser puro — sem `req`, `res`, `window`, `document`.
2. Injeção de dependências via constructor.
3. Retorne DTOs, nunca entidades de domínio expostas.
4. Trate erros de domínio e converta para erros de aplicação.
5. Nome do arquivo: `<action>-<entity>.ts` (ex: `create-user.ts`).

## Exemplo Completo
```typescript
// src/features/user/application/create-user.ts
import { IUserRepository } from '../domain/user-repository.interface';
import { User } from '../domain/user';
import { CreateUserDTO } from './dto/create-user.dto';
import { UserResponseDTO } from './dto/user-response.dto';
import { EmailAlreadyExistsError } from '../domain/errors';

export class CreateUserUseCase {
  constructor(private userRepo: IUserRepository) {}

  async execute(dto: CreateUserDTO): Promise<UserResponseDTO> {
    const existing = await this.userRepo.findByEmail(dto.email);
    if (existing) throw new EmailAlreadyExistsError(dto.email);

    const user = User.create(dto);
    await this.userRepo.save(user);

    return UserResponseDTO.fromDomain(user);
  }
}
```
