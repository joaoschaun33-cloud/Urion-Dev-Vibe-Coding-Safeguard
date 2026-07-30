import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main(): Promise<void> {
  console.log('🌱 Seeding database...');

  await prisma.todo.createMany({
    data: [
      { title: 'Aprender FSD', description: 'Estudar Feature-Sliced Design', priority: 'HIGH' },
      { title: 'Configurar CI/CD', isCompleted: true, priority: 'URGENT' },
      { title: 'Escrever testes', description: 'Cobertura >= 80%', priority: 'MEDIUM' },
    ],
    skipDuplicates: true,
  });

  console.log('✅ Seed completed!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
