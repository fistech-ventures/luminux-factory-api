import { BcryptHelper } from '@src/app/helpers';
import { DataSource, EntitySubscriberInterface, EventSubscriber } from 'typeorm';
import { Section } from '../entities/section.entity';

@EventSubscriber()
export class SectionSubscriber implements EntitySubscriberInterface<Section> {
  constructor(
    dataSource: DataSource,
    private readonly bcryptHelper: BcryptHelper,
  ) {
    dataSource.subscribers.push(this);
  }

  listenTo(): typeof Section {
    return Section;
  }


  async afterLoad(entity: Section): Promise<void> {
    if (entity?.items && entity?.items?.length) {
      entity.items = entity.items
        .map((sectionItem) => {
          return {
            // position: sectionItem.position,
            // productId: sectionItem.productId,
            // genreId: sectionItem.genreId,
            // authorId: sectionItem.authorId,
            // categoryId: sectionItem.categoryId,
            // mediaId: sectionItem.mediaId,
            // product: sectionItem?.product ? { ...sectionItem.product } : null,
            // genre: sectionItem?.genre ? { ...sectionItem.genre } : null,
            // author: sectionItem?.author ? { ...sectionItem.author } : null,
            // category: sectionItem?.category ? { ...sectionItem.category } : null,
            // media: sectionItem?.media ? { ...sectionItem.media } : null,
            ...sectionItem?.product,
            ...sectionItem?.genre,
            ...sectionItem?.author,
            ...sectionItem?.category,
            ...sectionItem?.media,
            position: sectionItem.position
          }
        });
    }
  }
}
