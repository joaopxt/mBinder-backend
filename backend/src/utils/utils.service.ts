import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Carta } from '../library/entities/library.entity';

export interface BulkImportResult {
  added: string[];
  notFound: string[];
  alreadyExists: string[];
}

export interface BulkImportConfig {
  entityName: string; // For error messages
  checkExisting: (cardNames: string[]) => Promise<Set<string>>;
  addCards: (cardIds: number[]) => Promise<void>;
}

@Injectable()
export class UtilsService {
  constructor(
    @InjectRepository(Carta)
    private cartaRepositorio: Repository<Carta>,
  ) {}

  /**
   * Generic bulk card import function
   * @param cardNames Array of card names to import
   * @param config Configuration object with entity-specific logic
   * @returns Result with added, notFound, and alreadyExists arrays
   */
  async addBulkCards(
    cardNames: string[],
    config: BulkImportConfig,
  ): Promise<BulkImportResult> {
    console.log(
      `[UtilsService] Adding bulk cards to ${config.entityName}:`,
      cardNames,
    );

    const result: BulkImportResult = {
      added: [],
      notFound: [],
      alreadyExists: [],
    };

    if (!cardNames || cardNames.length === 0) {
      return result;
    }

    // Get existing card names (lowercase for comparison)
    const existingCardNames = await config.checkExisting(cardNames);

    // Array to collect card IDs to add
    const cardIdsToAdd: number[] = [];
    const processedNames = new Set<string>(); // Prevent duplicates in same batch

    for (const cardName of cardNames) {
      const trimmedName = cardName.trim();
      if (!trimmedName) continue;

      const lowerName = trimmedName.toLowerCase();

      // Skip if already processed in this batch
      if (processedNames.has(lowerName)) {
        continue;
      }
      processedNames.add(lowerName);

      // Check if already exists in the target collection
      if (existingCardNames.has(lowerName)) {
        result.alreadyExists.push(trimmedName);
        continue;
      }

      // Find card in library
      const carta = await this.findCardByName(trimmedName);

      if (!carta) {
        result.notFound.push(trimmedName);
        continue;
      }

      // Add card ID to the list and mark as added
      cardIdsToAdd.push(carta.id);
      result.added.push(carta.name);
    }

    // Add all found cards using the provided function
    if (cardIdsToAdd.length > 0) {
      await config.addCards(cardIdsToAdd);
    }

    console.log(
      `[UtilsService] Bulk import result for ${config.entityName}:`,
      result,
    );
    return result;
  }

  /**
   * Find a card by name (exact match first, then case-insensitive)
   * @param cardName Name of the card to find
   * @returns Carta entity or null if not found
   */
  private async findCardByName(cardName: string): Promise<Carta | null> {
    // Try exact match first
    let carta = await this.cartaRepositorio.findOne({
      where: { name: cardName },
    });

    if (!carta) {
      // Try case-insensitive search
      carta = await this.cartaRepositorio
        .createQueryBuilder('carta')
        .where('LOWER(carta.name) = LOWER(:name)', { name: cardName })
        .getOne();
    }

    return carta;
  }

  /**
   * Parse card list text and extract card names
   * Removes quantities and extra whitespace
   * @param text Raw text with card list
   * @returns Array of clean card names
   */
  parseCardList(text: string): string[] {
    if (!text.trim()) return [];

    const lines = text.split('\n');
    const cardNames: string[] = [];

    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed) continue;

      // Remove quantity and whitespace from the beginning
      const match = trimmed.match(/^\s*\d*\s*(.+)$/);
      if (match && match[1]) {
        const cardName = match[1].trim();
        if (cardName) {
          cardNames.push(cardName);
        }
      }
    }

    return cardNames;
  }
}
