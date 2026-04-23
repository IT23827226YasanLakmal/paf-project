import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import QRModal from './QRModal';

describe('QRModal Component', () => {
    const mockResource = {
        id: 1,
        name: 'Main Lab',
        type: 'LAB',
        location: 'Ground Floor'
    };

    it('renders correctly when open', () => {
        render(<QRModal isOpen={true} onClose={() => {}} resource={mockResource} />);
        
        expect(screen.getByText('Resource QR Code')).toBeInTheDocument();
        expect(screen.getByText('Main Lab')).toBeInTheDocument();
        expect(screen.getByText('LAB • Ground Floor')).toBeInTheDocument();
    });

    it('calls onClose when X button is clicked', () => {
        const onClose = vi.fn();
        render(<QRModal isOpen={true} onClose={onClose} resource={mockResource} />);
        
        const closeButton = screen.getByRole('button', { name: '' }); // The X button usually lacks text
        fireEvent.click(closeButton);
        
        expect(onClose).toHaveBeenCalled();
    });

    it('displays the download button', () => {
        render(<QRModal isOpen={true} onClose={() => {}} resource={mockResource} />);
        expect(screen.getByText('Download PNG')).toBeInTheDocument();
    });
});
