import { schema } from 'normalizr';
import PropTypes from 'prop-types';

import STATUSES from 'constants/app/boxes/statuses';
import EventSchema from 'store/schemas/Boxes/Events';
import SenderSchema from 'store/schemas/Boxes/Sender';

const entity = new schema.Entity('boxes', {
  events: EventSchema.collection,
  lastEvent: EventSchema.entity,
  creator: SenderSchema.entity,
});

const collection = [entity];

const BoxesSchema = {
  entity,
  collection,
  propTypes: {
    id: PropTypes.string.isRequired,
    ownerId: PropTypes.string,
    serverCreatedAt: PropTypes.string,
    updatedAt: PropTypes.string,
    lifecycle: PropTypes.oneOf(STATUSES),
    // eslint-disable-next-line react/forbid-foreign-prop-types
    events: PropTypes.arrayOf(PropTypes.shape(EventSchema.propTypes)),
    // eslint-disable-next-line react/forbid-foreign-prop-types
    creator: PropTypes.shape(SenderSchema.propTypes),
    // eslint-disable-next-line react/forbid-foreign-prop-types
    lastEvent: PropTypes.shape(EventSchema.propTypes),
  },
};

export default BoxesSchema;
