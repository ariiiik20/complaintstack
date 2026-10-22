import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import StatusStepper from '../complaints/StatusStepper';

describe('StatusStepper Component', () => {
  it('renders all stepper steps correctly for Pending status', () => {
    render(<StatusStepper status="Pending" />);

    expect(screen.getByText('Pending')).toBeInTheDocument();
    expect(screen.getByText('In Progress')).toBeInTheDocument();
    expect(screen.getByText('Resolved')).toBeInTheDocument();
  });

  it('renders correctly for In Progress status', () => {
    render(<StatusStepper status="In Progress" />);

    expect(screen.getByText('Pending')).toBeInTheDocument();
    expect(screen.getByText('In Progress')).toBeInTheDocument();
    expect(screen.getByText('Resolved')).toBeInTheDocument();
  });

  it('renders correctly for Resolved status', () => {
    render(<StatusStepper status="Resolved" />);

    expect(screen.getByText('Resolved')).toBeInTheDocument();
  });

  it('renders Complaint Rejected banner when status is Rejected', () => {
    render(<StatusStepper status="Rejected" />);

    expect(screen.getByText('Complaint Rejected')).toBeInTheDocument();
    expect(screen.queryByText('Pending')).not.toBeInTheDocument();
  });
});
