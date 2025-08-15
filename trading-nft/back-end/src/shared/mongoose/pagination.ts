import { IPaginationOptions, IPaginatedResult } from '../shared.interface';
import { Model, Document } from 'mongoose';

export async function paginate<T extends Document>(
  model: Model<T>,
  options: IPaginationOptions<T>
): Promise<IPaginatedResult<T>> {
  const {
    page = 1,
    limit = 10,
    sort = { createdAt: -1 },
    lean = true,
    select,
    populate,
  } = options;

  const skip = (page - 1) * limit;
  const [items, total] = await Promise.all([
    model
      .find()
      .sort(sort)
      .skip(skip)
      .limit(limit)
      .select(select as string | Record<string, number>)
      .populate(populate || [])
      .lean(lean) as Promise<T[]>,
    model.countDocuments(),
  ]);

  const totalPages = Math.ceil(total / limit);

  return {
    items,
    meta: {
      page,
      limit,
      totalItems: total,
      totalPages,
      hasNextPage: page < totalPages,
      hasPreviousPage: page > 1,
    },
  };
}
