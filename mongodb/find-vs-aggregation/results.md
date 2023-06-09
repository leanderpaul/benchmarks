# Results

### Comparing Native findOne, Mongoose findOne and Aggregation

| (index) | Name          | Total time (in ns) | Average time (in ns) |
| ------- | ------------- | ------------------ | -------------------- |
| 0       | 'Native'      | '12,206,632,667'   | '1,220,663'          |
| 1       | 'Aggregation' | '12,314,453,942'   | '1,231,445'          |
| 2       | 'Mongoose'    | '13,399,537,484'   | '1,339,953'          |

### Comparing Native find, Mongoose find and Aggregation

| (index) | Name          | Total time (in ns) | Average time (in ns) |
| ------- | ------------- | ------------------ | -------------------- |
| 0       | 'Native'      | '11,488,666,069'   | '1,148,866'          |
| 1       | 'Aggregation' | '12,090,060,775'   | '1,209,006'          |
| 2       | 'Mongoose'    | '12,591,654,424'   | '1,259,165'          |

### Comparing inner join using Native findOne and find, Mongoose findOne and find and Aggregation

| (index) | Name          | Total time (in ns) | Average time (in ns) |
| ------- | ------------- | ------------------ | -------------------- |
| 0       | 'Aggregation' | '39,877,425,332'   | '3,987,742'          |
| 1       | 'Native'      | '46,695,019,048'   | '4,669,501'          |
| 2       | 'Mongoose'    | '50,877,484,133'   | '5,087,748'          |
