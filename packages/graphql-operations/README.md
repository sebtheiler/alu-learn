# GraphQL Operations

A set of GraphQL queries and mutations that can be run again Alu Learn's GraphQL API

Example:
```typescript
import UpdateCourse from "graphql-operations/operations/UpdateCourse";

const App: React.FC = () => {
  const [updateCourse] = useMutation<
    Mutation["updateCourse"],
    MutationUpdateCourseArgs
  >(UpdateCourse);

  const onSubmit = async () => {
    await updateCourse({
      variables: {
        ...
      },
    });
  }

  return ...;
}

```