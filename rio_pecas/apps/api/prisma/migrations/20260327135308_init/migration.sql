-- CreateTable
CREATE TABLE `User` (
    `id` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `email` VARCHAR(191) NOT NULL,
    `passwordHash` VARCHAR(191) NOT NULL,
    `role` ENUM('ADMIN', 'MANAGER', 'ANALYST', 'VIEWER') NOT NULL DEFAULT 'ANALYST',
    `isActive` BOOLEAN NOT NULL DEFAULT true,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `User_email_key`(`email`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Company` (
    `id` VARCHAR(191) NOT NULL,
    `code` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `shortName` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `Company_code_key`(`code`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Client` (
    `id` VARCHAR(191) NOT NULL,
    `code` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `legalName` VARCHAR(191) NULL,
    `document` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `Client_code_key`(`code`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Vendor` (
    `id` VARCHAR(191) NOT NULL,
    `code` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `Vendor_code_key`(`code`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `AccountCategory` (
    `id` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `dreGroup` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `AccountCategory_name_key`(`name`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `ChartOfAccount` (
    `id` VARCHAR(191) NOT NULL,
    `code` VARCHAR(191) NOT NULL,
    `groupName` VARCHAR(191) NOT NULL,
    `fixedOrVariable` VARCHAR(191) NULL,
    `description` VARCHAR(191) NOT NULL,
    `categoryId` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `ChartOfAccount_code_key`(`code`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `PaymentMethod` (
    `id` VARCHAR(191) NOT NULL,
    `code` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `PaymentMethod_code_key`(`code`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `FinancialLaunch` (
    `id` VARCHAR(191) NOT NULL,
    `launchDate` DATETIME(3) NOT NULL,
    `companyId` VARCHAR(191) NOT NULL,
    `clientId` VARCHAR(191) NULL,
    `accountId` VARCHAR(191) NULL,
    `vendorId` VARCHAR(191) NULL,
    `paymentMethodId` VARCHAR(191) NULL,
    `description` VARCHAR(191) NULL,
    `revenueAmount` DECIMAL(14, 2) NULL,
    `expenseAmount` DECIMAL(14, 2) NULL,
    `machinesQuantity` INTEGER NULL,
    `machineCondition` ENUM('NEW', 'USED') NULL,
    `dueDays` INTEGER NULL,
    `dueDate` DATETIME(3) NULL,
    `settlementDate` DATETIME(3) NULL,
    `totalSettledAmount` DECIMAL(14, 2) NULL,
    `financialStatus` ENUM('OPEN', 'OVERDUE', 'PARTIAL', 'SETTLED') NOT NULL DEFAULT 'OPEN',
    `delayDays` INTEGER NULL,
    `isDuplicate` BOOLEAN NOT NULL DEFAULT false,
    `isCriticalLate` BOOLEAN NOT NULL DEFAULT false,
    `businessYear` INTEGER NOT NULL,
    `businessMonth` INTEGER NOT NULL,
    `dueYear` INTEGER NULL,
    `dueMonth` INTEGER NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `FinancialInstallment` (
    `id` VARCHAR(191) NOT NULL,
    `launchId` VARCHAR(191) NOT NULL,
    `installmentNo` INTEGER NOT NULL,
    `dueDate` DATETIME(3) NULL,
    `amount` DECIMAL(14, 2) NOT NULL,
    `settledAmount` DECIMAL(14, 2) NULL,
    `settlementDate` DATETIME(3) NULL,
    `status` ENUM('OPEN', 'OVERDUE', 'PARTIAL', 'SETTLED') NOT NULL DEFAULT 'OPEN',

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `ImportBatch` (
    `id` VARCHAR(191) NOT NULL,
    `sourceFileName` VARCHAR(191) NOT NULL,
    `sourceFileHash` VARCHAR(191) NOT NULL,
    `versionTag` VARCHAR(191) NOT NULL,
    `status` ENUM('PENDING', 'PROCESSING', 'COMPLETED', 'FAILED', 'ROLLED_BACK') NOT NULL DEFAULT 'PENDING',
    `importedCount` INTEGER NOT NULL DEFAULT 0,
    `ignoredCount` INTEGER NOT NULL DEFAULT 0,
    `duplicatesCount` INTEGER NOT NULL DEFAULT 0,
    `invalidCount` INTEGER NOT NULL DEFAULT 0,
    `updatedCount` INTEGER NOT NULL DEFAULT 0,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `CashflowForecast` (
    `id` VARCHAR(191) NOT NULL,
    `scenario` ENUM('CONSERVATIVE', 'PROBABLE', 'OPTIMISTIC') NOT NULL,
    `referenceDate` DATETIME(3) NOT NULL,
    `projectedIn` DECIMAL(14, 2) NOT NULL,
    `projectedOut` DECIMAL(14, 2) NOT NULL,
    `projectedNet` DECIMAL(14, 2) NOT NULL,
    `notes` VARCHAR(191) NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `ChartOfAccount` ADD CONSTRAINT `ChartOfAccount_categoryId_fkey` FOREIGN KEY (`categoryId`) REFERENCES `AccountCategory`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `FinancialLaunch` ADD CONSTRAINT `FinancialLaunch_companyId_fkey` FOREIGN KEY (`companyId`) REFERENCES `Company`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `FinancialLaunch` ADD CONSTRAINT `FinancialLaunch_clientId_fkey` FOREIGN KEY (`clientId`) REFERENCES `Client`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `FinancialLaunch` ADD CONSTRAINT `FinancialLaunch_accountId_fkey` FOREIGN KEY (`accountId`) REFERENCES `ChartOfAccount`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `FinancialLaunch` ADD CONSTRAINT `FinancialLaunch_vendorId_fkey` FOREIGN KEY (`vendorId`) REFERENCES `Vendor`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `FinancialLaunch` ADD CONSTRAINT `FinancialLaunch_paymentMethodId_fkey` FOREIGN KEY (`paymentMethodId`) REFERENCES `PaymentMethod`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `FinancialInstallment` ADD CONSTRAINT `FinancialInstallment_launchId_fkey` FOREIGN KEY (`launchId`) REFERENCES `FinancialLaunch`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
