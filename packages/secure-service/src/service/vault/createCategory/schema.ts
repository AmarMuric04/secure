import { z } from "zod";

import { categorySchema } from "../../../schemas";

const createdCategorySchema = z.object({ category: categorySchema });

export { createdCategorySchema };
