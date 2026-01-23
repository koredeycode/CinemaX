import { getUserFromRequest } from "@/lib/auth";
import dbConnect from "@/lib/db";
import logger from "@/lib/logger";
import Booking from "@/models/Booking";
import { IMovie } from "@/models/Movie";
import { NextRequest, NextResponse } from "next/server";
import { degrees, PDFDocument, rgb, StandardFonts } from "pdf-lib";
import QRCode from "qrcode";

export async function GET(
    req: NextRequest,
    props: { params: Promise<{ bookingId: string }> }
) {
    const params = await props.params;
    await dbConnect();
    const { bookingId } = params;

    try {
        const booking = await Booking.findById(bookingId);
        if (!booking) {
            return NextResponse.json({ error: "Booking not found" }, { status: 404 });
        }

        // Security Check: Verify ownership if locked to a user
        if (booking.user) {
            const userPayload = getUserFromRequest(req);
            if (!userPayload || userPayload.userId !== booking.user.toString()) {
                logger.warn(`Unauthorized ticket access attempt: User ${userPayload?.userId} tried to access booking ${bookingId}`);
                return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
            }
        }

        const movie = await Booking.findById(bookingId).populate("movie").then(b => b?.movie as unknown as IMovie);
        
        if (!movie) {
             return NextResponse.json({ error: "Movie not found" }, { status: 404 });
        }
        
        const dateObj = new Date(booking.date);
        const dateStr = dateObj.toLocaleDateString("en-US", { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
        const timeStr = booking.time;

        // 1. Create PDF (Landscape 600x250)
        const pdfDoc = await PDFDocument.create();
        const page = pdfDoc.addPage([600, 250]);
        const { width, height } = page.getSize();
        
        // Colors
        const cinemaRed = rgb(0.8, 0.1, 0.1);
        const darkGray = rgb(0.2, 0.2, 0.2);
        const lightGray = rgb(0.95, 0.95, 0.95);
        
        // Fonts
        const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
        const boldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

        // 2. Generate QR
        const qrCodeDataUrl = await QRCode.toDataURL(bookingId, { margin: 1 });
        const qrImage = await pdfDoc.embedPng(qrCodeDataUrl);
        
        // 3. Draw Design
        
        // Background
        page.drawRectangle({
            x: 0, y: 0, width, height,
            color: lightGray
        });

        // Left Header Strip (Red)
        page.drawRectangle({
            x: 0, y: 0, width: 40, height,
            color: cinemaRed
        });
        
        // Rotated "CINEMA TICKET" text on the red strip
        page.drawText('CINEMA TICKET', {
            x: 15,
            y: 30, // Start from bottom
            size: 24,
            font: boldFont,
            color: rgb(1, 1, 1),
            rotate: degrees(90),
        });

        // Perforated Line (Separator at x=420)
        const separatorX = 420;
        const dashHeight = 10;
        const gapHeight = 5;
        for (let y = 0; y < height; y += (dashHeight + gapHeight)) {
            page.drawLine({
                start: { x: separatorX, y },
                end: { x: separatorX, y: y + dashHeight },
                thickness: 1,
                color: rgb(0.7, 0.7, 0.7),
            });
        }

        // --- MAIN SECTION (Left of separator) ---
        const mainX = 60;
        
        // Movie Title
        page.drawText(movie.title.toUpperCase(), { 
            x: mainX, 
            y: height - 60, 
            size: 28, 
            font: boldFont, 
            color: darkGray,
            maxWidth: 340,
        });

        // Labels & Info
        const infoY = 120;
        
        // Date
        page.drawText('DATE', { x: mainX, y: infoY + 20, size: 9, font, color: rgb(0.5, 0.5, 0.5) });
        page.drawText(dateStr, { x: mainX, y: infoY, size: 14, font: boldFont, color: darkGray });

        // Time
        page.drawText('TIME', { x: mainX + 200, y: infoY + 20, size: 9, font, color: rgb(0.5, 0.5, 0.5) });
        page.drawText(timeStr, { x: mainX + 200, y: infoY, size: 14, font: boldFont, color: darkGray });

        // Hall / Screen (Static for now)
        page.drawText('HALL', { x: mainX, y: infoY - 40, size: 9, font, color: rgb(0.5, 0.5, 0.5) });
        page.drawText('HALL 1', { x: mainX, y: infoY - 60, size: 14, font: boldFont, color: darkGray });

        // Guest
        page.drawText('GUEST', { x: mainX + 200, y: infoY - 40, size: 9, font, color: rgb(0.5, 0.5, 0.5) });
        const guestName = booking.guestDetails?.name || "Guest";
        page.drawText(guestName.length > 20 ? guestName.substring(0, 18) + "..." : guestName, 
            { x: mainX + 200, y: infoY - 60, size: 14, font: boldFont, color: darkGray }
        );

        // --- STUB SECTION (Right of separator) ---
        const stubX = separatorX + 20;
        
        // Top Banner
        page.drawRectangle({
            x: separatorX, y: height - 50,
            width: width - separatorX, height: 50,
            color: cinemaRed
        });
        page.drawText('ADMIT ONE', {
            x: stubX + 35, y: height - 35,
            size: 16,
            font: boldFont,
            color: rgb(1,1,1)
        });

        // Seat Info (Big)
        page.drawText('SEAT', { x: stubX, y: height - 80, size: 10, font, color: rgb(0.5, 0.5, 0.5) });
        
        // Handle multiple seats - just show first or range. 
        // For visual simplicity in a stub, displaying the first/primary seat or "3 Seats" is common. 
        // We'll list them but prevent overflow.
        let seatText = booking.seats.join(", ");
        if (seatText.length > 15) seatText = booking.seats[0] + " +" + (booking.seats.length - 1);
        
        page.drawText(seatText, { x: stubX, y: height - 105, size: 24, font: boldFont, color: darkGray });

        // QR Code
        const qrSize = 80;
        page.drawImage(qrImage, {
            x: stubX + 25,
            y: 30, // Bottom area
            width: qrSize,
            height: qrSize
        });
        
        // Booking ID text below QR
        // page.drawText(booking._id.toString().substring(0, 8).toUpperCase(), { x: stubX + 35, y: 15, size: 8, font, color: rgb(0.5,0.5,0.5) });

        // 4. Output
        const pdfBytes = await pdfDoc.save();

        return new NextResponse(Buffer.from(pdfBytes), {
            headers: {
                "Content-Type": "application/pdf",
                "Content-Disposition": `attachment; filename="ticket-${bookingId}.pdf"`,
            },
        });

    } catch (error) {
        logger.error("Ticket generation failed:", error);
         return NextResponse.json({ error: "Create ticket failed" }, { status: 500 });
    }
}
