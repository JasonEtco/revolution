import React, { Component, PropTypes } from 'react';
import h from '../../helpers';
import * as assets from '../../assets';
import './App.scss';

const { trump, hillaryclinton, vader, whitehouse, presidentialmusic } = assets.default;

const ordered = {
  trump: { name: 'Donald Trump', image: trump },
  vader: { name: 'Darth Vader', image: vader },
  clinton: { name: 'Hillary Clinton', image: hillaryclinton },
};

export default class App extends Component {
  static propTypes = {
    socket: PropTypes.object.isRequired,
  };

  constructor(props) {
    super(props);
    this.vote = this.vote.bind(this);
    this.transitionEnd = this.transitionEnd.bind(this);
  }

  state = {
    votes: false,
    voting: true,
    candidates: [null, null],
  }

  componentDidMount() {
    const { socket } = this.props;
    socket.on('get-votes', (data) => {
      this.setState({ ...data, candidates: [
        ordered[data.candidates[0]],
        ordered[data.candidates[1]]
      ] });
      if (data.connectCounter === 1) {
        // Set timer
        setTimeout(() => {
          socket.emit('end-votes');
        }, 10000);
      }
    });

    socket.on('vote', votes => this.setState({ votes }));

    socket.on('end-votes', () => {
      const { votes } = this.state;
      const winner = votes[0] < votes[1] ? 0 : 1;
      this.setState({ leaving: true, winner });
    });
  }

  transitionEnd(e) {
    console.log(e.propertyName);
    if (e.propertyName.includes('transform')) {
      this.setState({ voting: false });
    }
  }

  vote(index) {
    const { socket } = this.props;
    socket.emit('vote', index);
  }

  render() {
    const { socket } = this.props;
    const { votes, voting, candidates, winner, leaving } = this.state;
    if (!socket || votes === false) return null;

    if (voting) {
      return (
        <main className="main">
          <div className={`candidates ${leaving && 'leaving'}`} onTransitionEnd={this.transitionEnd}>
            {candidates.map((c, i) => (
              <div className="candidate" key={c.name}>
                <div className="candidate__image" style={{ backgroundImage: `url(${c.image})` }} role="presentation" alt={c.name} />
                <h1>{c.name}</h1>
                <button className="candidate__vote" onClick={() => this.vote(i)}>VOTE</button>
                <p><strong>Votes: </strong>{votes[i]}</p>
              </div>),
            )}
          </div>

          <audio autoPlay src={presidentialmusic} />
        </main>
      );
    }

    return (
      <div className="winner">{candidates[winner].name}</div>
    );
  }
}
