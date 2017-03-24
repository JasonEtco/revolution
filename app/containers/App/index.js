import React, { Component, PropTypes } from 'react';
import * as assets from '../../assets';
import './App.scss';

const {
  trump,
  hillaryclinton,
  vader,
  presidentialmusic,
  text,
  deathmetal,
  warren,
  sanders,
  drake,
  kanye,
} = assets.default;

const ordered = {
  trump: { name: 'Donald Trump', image: trump },
  vader: { name: 'Darth Vader', image: vader },
  clinton: { name: 'Hillary Clinton', image: hillaryclinton },
  sanders: { name: 'Bernie Sanders', image: sanders },
  drake: { name: 'Drake', image: drake },
  warren: { name: 'Elizabeth Warren', image: warren },
  kanye: { name: 'Kanye West', image: kanye },
};

export default class App extends Component {
  static propTypes = {
    socket: PropTypes.object.isRequired,
  };

  constructor(props) {
    super(props);
    this.vote = this.vote.bind(this);
    this.transitionEnd = this.transitionEnd.bind(this);
    this.winnerTransitionEnd = this.winnerTransitionEnd.bind(this);
    this.videoEnd = this.videoEnd.bind(this);
  }

  state = {
    didVote: false,
    votes: false,
    voting: true,
    candidates: [null, null],
    textPhase: false,
    revolutionPhase: false,
  }

  componentDidMount() {
    const { socket } = this.props;

    // Listen for socket events
    socket.on('get-votes', (data) => {
      this.setState({ ...data,
        candidates: [
          ordered[data.candidates[0]],
          ordered[data.candidates[1]],
        ],
      });
      if (data.connectCounter === 1) {
        // Set timer
        setTimeout(() => {
          socket.emit('end-votes');
        }, data.timer || 15000);
      }
    });

    // Update the current number of votes
    socket.on('vote', votes => this.setState({ votes }));

    // Once voting has ended, move on to the next scene
    socket.on('end-votes', () => {
      const { votes } = this.state;
      const winner = votes[0] < votes[1] ? 0 : 1;
      this.setState({ leaving: true, winner });
    });
  }

  componentDidUpdate(prevProps, prevState) {
    if (prevState.voting && this.state.voting === false) {
      document.body.classList.add('body--red');

      setTimeout(() => {
        this.setState({ textPhase: true });
      }, 5000);
    }
  }

  transitionEnd(e) {
    if (e.propertyName.includes('transform')) {
      this.setState({ voting: false });
    }
  }

  winnerTransitionEnd(e) {
    if (e.propertyName === 'height') {
      this.video.play();
    }
  }

  videoEnd() {
    setTimeout(() => {
      this.setState({ revolutionPhase: true });
    }, 2000);
  }

  vote(index) {
    const { socket } = this.props;
    this.setState({ didVote: true });
    socket.emit('vote', index);
  }

  render() {
    const { socket } = this.props;
    const {
      votes,
      voting,
      candidates,
      winner,
      leaving,
      didVote,
      textPhase,
      revolutionPhase,
    } = this.state;

    if (!socket || votes === false) return null;

    // If during voting phase
    if (voting) {
      return (
        <main className="main">
          <div className={`candidates ${leaving && 'leaving'}`} onTransitionEnd={this.transitionEnd}>
            {candidates.map((c, i) => (
              <div className="candidate" key={c.name}>
                <div className="candidate__image" style={{ backgroundImage: `url(${c.image})` }} role="presentation" alt={c.name} />
                <h1>{c.name}</h1>
                <button disabled={didVote} className="candidate__vote" onClick={() => this.vote(i)}>VOTE</button>
                <p><strong>Votes: </strong>{votes[i]}</p>
              </div>),
            )}
          </div>

          <audio autoPlay src={presidentialmusic} />
        </main>
      );
    }

    // If not in voting phase
    const w = candidates[winner];
    return (
      <div className="winnerPhase">
        <section className={`candidate ${textPhase && 'textPhase'}`} key={w.name} onTransitionEnd={this.winnerTransitionEnd}>
          <div className="candidate__image" style={{ backgroundImage: `url(${w.image})` }} role="presentation" alt={w.name} />
          <h1>{w.name} is the winner!</h1>
        </section>

        <section className={`text ${revolutionPhase && 'revolutionPhase'}`}>
          <video muted ref={(r) => { this.video = r; }} onEnded={this.videoEnd}>
            <source src={text.webm} type="video/webm" />
            <source src={text.mp4} type="video/mp4" />
          </video>
        </section>

        <section className="revolution">
          <span>Let&apos;s start a...</span>
          <h1>Revolution</h1>
        </section>
        <audio autoPlay src={deathmetal} />
      </div>
    );
  }
}
