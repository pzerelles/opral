[**@lix-js/sdk**](../README.md)

***

[@lix-js/sdk](../README.md) / switchVersion

# Function: switchVersion()

> **switchVersion**(`args`): `Promise`\<`void`\>

Defined in: [packages/lix-sdk/src/version/switch-version.ts:29](https://github.com/pzerelles/opral/blob/e1a1649dcf42f139cb42fdb0f4eb674e7e5863f4/packages/lix-sdk/src/version/switch-version.ts#L29)

Switches the current Version to the given Version.

The Version must already exist before calling this function.

## Parameters

### args

#### lix

[`Lix`](../type-aliases/Lix.md)

#### to

`Pick`\<\{ `change_set_id`: `string`; `id`: `string`; `name`: `null` \| `string`; `working_change_set_id`: `string`; \}, `"id"`\>

## Returns

`Promise`\<`void`\>

## Examples

```ts
  await switchVersion({ lix, to: otherVersion });
  ```

Switching Versiones to a newly created Version.

  ```ts
  await lix.db.transaction().execute(async (trx) => {
     const newVersion = await createVersion({ lix: { db: trx }, parent: currentVersion });
     await switchVersion({ lix: { db: trx }, to: newVersion });
  });
  ```
