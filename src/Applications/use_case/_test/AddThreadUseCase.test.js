const AddedThread = require('../../../Domains/threads/entities/AddedThread');
const AddThread = require('../../../Domains/threads/entities/AddThread');
const ThreadRepository = require('../../../Domains/threads/ThreadRepository');
const AddThreadUseCase = require('../AddThreadUseCase');

describe('AddThreadUseCase', () => {
  it('should orchestrating the add thread action correctly', async () => {
    const payload = {
      owner: 'user-123',
      title: 'New Thread',
      body: 'thread content',
    };

    const mockAddedThread = new AddedThread({
      id: 'thread-123',
      title: 'New Thread',
      owner: 'user-123',
    });

    const mockThreadRepository = new ThreadRepository();

    mockThreadRepository.addThread = jest.fn()
      .mockImplementation(() => Promise.resolve(new AddedThread({
        id: 'thread-123',
        title: 'New Thread',
        owner: 'user-123',
      })));

    const addThreadUseCase = new AddThreadUseCase({
      threadRepository: mockThreadRepository,
    });

    const addedThread = await addThreadUseCase.execute(payload);

    expect(addedThread).toStrictEqual(mockAddedThread);
    expect(mockThreadRepository.addThread).toHaveBeenCalledWith(new AddThread({
      owner: 'user-123',
      title: 'New Thread',
      body: 'thread content',
    }));
  });
});
