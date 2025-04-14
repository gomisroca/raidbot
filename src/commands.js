/**
 * Share command metadata from a common spot to be used for both runtime
 * and registration.
 */

export const DAYS_COMMAND = {
  name: 'days',
  description: 'Create a poll to decide which days we raid.',
};

export const TIMES_COMMAND = {
  name: 'times',
  description: 'Create a poll to decide at which time we start raid.',
  options: [
    {
      name: 'start_time',
      description:
        'The time we start raiding (please use Server Time for clarity)',
      type: 4,
      required: true,
    },
  ],
};
