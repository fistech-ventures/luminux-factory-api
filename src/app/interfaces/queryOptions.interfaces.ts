import { FindOptionsRelations, FindOptionsSelect } from 'typeorm';

export interface IFindBaseOptions<T> {
  relations?: FindOptionsRelations<T>;
  select?: FindOptionsSelect<T>;
  SEARCH_TERMS?: string[];
}
