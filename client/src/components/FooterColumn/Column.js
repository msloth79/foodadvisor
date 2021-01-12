import React from 'react';
import { Link } from 'react-router-dom';

const Column = ({ links }) => {
  const formattedLinks = links.reduce((accumulator, curr) => {
    let to = curr.url;

    if (curr.universal) {
      to = `/${curr.universal.slug}`;
    }

    accumulator.push({ name: curr.label, to });

    return accumulator;
  }, []);

  return (
    <div className="nav-list">
      {formattedLinks.map(link => {
        if (link.to.startsWith('https')) {
          return (
            <a href={link.to} target="_blank" key={link.to}>
              {link.name}
            </a>
          );
        }
        return (
          <Link
            key={link.name}
            to={link.to}
            className={
              link.name === 'My account' || link.name === 'Favorites'
                ? 'main-link'
                : ''
            }
          >
            <span title={link.name}>{link.name}</span>
          </Link>
        );
      })}
    </div>
  );
};

export default Column;
