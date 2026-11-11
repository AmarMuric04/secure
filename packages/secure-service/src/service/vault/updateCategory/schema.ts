import { z } from "zod";

import { categorySchema } from "../../../schemas";

const updatedCategorySchema = z.object({ category: categorySchema });

export { updatedCategorySchema };
