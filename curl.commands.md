# EduCase API Endpoints

## School Management

### Add a New School

**METHOD:** `POST`  
**URL:** `https://educase.marsalsoren2050.workers.dev/add-school`

**Query Parameters:**
| Parameter | Type | Description |
|------------|---------|---------------------------------------|
| name | string | Name of the school |
| address | string | Physical address of the school |
| latitude | number | Geographic latitude of school location |
| longitude | number | Geographic longitude of school location |

**Example:**

```
https://educase.marsalsoren2050.workers.dev/add-school?name=ABC&address=Main&latitude=10259.3&longitude=405.6
```

---

### List Schools

**METHOD:** `GET`  
**URL:** `https://educase.marsalsoren2050.workers.dev/list-schools`

**Query Parameters:**
| Parameter | Type | Description |
|------------|---------|---------------------------------------|
| latitude | number | Geographic latitude for proximity search |
| longitude | number | Geographic longitude for proximity search |

**Example:**

```
https://educase.marsalsoren2050.workers.dev/list-schools?latitude=120.3&longitude=45.6
```

> **Note:** Schools will be returned in order of proximity to the provided coordinates.

---

## Testing

These endpoints can be tested using Postman or any other API testing tool.
